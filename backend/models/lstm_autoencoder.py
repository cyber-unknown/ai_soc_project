import tensorflow as tf
import numpy as np
from sklearn.preprocessing import StandardScaler

class LogAnalysisModel:
    def __init__(self, sequence_length, n_features):
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.model = self._build_model()
        self.threshold = 0.7
        self.scaler = StandardScaler()
        
    def _build_model(self):
        # Encoder
        inputs = tf.keras.layers.Input(shape=(self.sequence_length, self.n_features))
        encoded = tf.keras.layers.LSTM(32, return_sequences=True)(inputs)
        encoded = tf.keras.layers.Dropout(0.2)(encoded)
        encoded = tf.keras.layers.LSTM(16)(encoded)
        encoded = tf.keras.layers.Dense(8, activation='relu')(encoded)
        
        # Decoder
        decoded = tf.keras.layers.RepeatVector(self.sequence_length)(encoded)
        decoded = tf.keras.layers.LSTM(16, return_sequences=True)(decoded)
        decoded = tf.keras.layers.Dropout(0.2)(decoded)
        decoded = tf.keras.layers.LSTM(32, return_sequences=True)(decoded)
        outputs = tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(self.n_features))(decoded)
        
        return tf.keras.Model(inputs, outputs)
    
    def train(self, sequences, epochs=10, batch_size=32):
        """Train the model on the input sequences."""
        self.model.compile(optimizer='adam', loss='mse')
        history = self.model.fit(
            sequences, sequences,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.1,
            verbose=0
        )
        
        # Calculate reconstruction error threshold
        reconstructions = self.model.predict(sequences)
        mse = np.mean(np.power(sequences - reconstructions, 2), axis=(1, 2))
        self.threshold = np.percentile(mse, 95)  # Set threshold at 95th percentile
        
        return history
    
    def get_anomaly_score(self, sequences):
        """Calculate anomaly scores for input sequences."""
        reconstructions = self.model.predict(sequences)
        mse = np.mean(np.power(sequences - reconstructions, 2), axis=(1, 2))
        scores = tf.nn.sigmoid(tf.convert_to_tensor(mse))  # Normalize scores between 0 and 1
        return scores
    
    def detect_anomalies(self, sequences):
        """Detect anomalies in the input sequences."""
        reconstructions = self.model.predict(sequences)
        mse = np.mean(np.power(sequences - reconstructions, 2), axis=(1, 2))
        return tf.cast(mse > self.threshold, tf.float32)
    
    def get_confidence_scores(self, sequences):
        """Calculate confidence scores for anomaly predictions."""
        reconstructions = self.model.predict(sequences)
        mse = np.mean(np.power(sequences - reconstructions, 2), axis=(1, 2))
        
        # Calculate distance from threshold
        distances = np.abs(mse - self.threshold)
        max_distance = max(np.max(distances), 1e-10)  # Avoid division by zero
        
        # Normalize distances to get confidence scores
        confidence = distances / max_distance
        return tf.nn.sigmoid(tf.convert_to_tensor(confidence))
    
    def save_model(self, path):
        """Save the model to disk."""
        self.model.save(path)
    
    @classmethod
    def load_model(cls, path, sequence_length, n_features):
        """Load a saved model from disk."""
        instance = cls(sequence_length, n_features)
        instance.model = tf.keras.models.load_model(path)
        return instance
