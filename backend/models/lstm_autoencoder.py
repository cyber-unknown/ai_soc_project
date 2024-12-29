import tensorflow as tf
from tensorflow.keras import layers, Model

class LogAnalysisModel(Model):
    def __init__(self, seq_length, n_features, latent_dim=64):
        super(LogAnalysisModel, self).__init__()
        self.seq_length = seq_length
        self.n_features = n_features
        self.latent_dim = latent_dim
        
        # Encoder
        self.encoder = tf.keras.Sequential([
            layers.Input(shape=(seq_length, n_features)),
            layers.BatchNormalization(),
            layers.Bidirectional(layers.LSTM(latent_dim, return_sequences=True)),
            layers.Dropout(0.2),
            layers.BatchNormalization(),
            layers.Bidirectional(layers.LSTM(latent_dim // 2)),
            layers.Dense(latent_dim, activation='relu')
        ])
        
        # Attention mechanism
        self.attention = layers.Dense(1, activation='tanh')
        
        # Decoder
        self.decoder = tf.keras.Sequential([
            layers.RepeatVector(seq_length),
            layers.BatchNormalization(),
            layers.Bidirectional(layers.LSTM(latent_dim, return_sequences=True)),
            layers.Dropout(0.2),
            layers.BatchNormalization(),
            layers.TimeDistributed(layers.Dense(n_features))
        ])
        
    def call(self, inputs):
        # Encode
        encoded = self.encoder(inputs)
        
        # Apply attention
        attention_weights = self.attention(encoded)
        attention_weights = tf.nn.softmax(attention_weights, axis=1)
        context_vector = attention_weights * encoded
        
        # Decode
        decoded = self.decoder(context_vector)
        return decoded
    
    def get_anomaly_score(self, x):
        reconstructed = self(x)
        mse = tf.keras.losses.MeanSquaredError()
        reconstruction_error = mse(x, reconstructed)
        return reconstruction_error

    def detect_anomalies(self, x, threshold=None):
        scores = self.get_anomaly_score(x)
        if threshold is None:
            threshold = tf.math.reduce_mean(scores) + 2 * tf.math.reduce_std(scores)
        return scores > threshold
