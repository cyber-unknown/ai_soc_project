import pandas as pd
import numpy as np
from datetime import datetime
import tensorflow as tf
from models.lstm_autoencoder import LogAnalysisModel
from sklearn.preprocessing import StandardScaler, LabelEncoder
import re
import json
import os

def preprocess_dynamic_data(df):
    """Preprocess any type of CSV data for analysis."""
    processed_data = []
    label_encoders = {}
    
    for column in df.columns:
        # Convert to string and handle NaN values
        series = df[column].fillna('UNKNOWN').astype(str)
        
        if is_numeric_column(df[column]):
            # For numeric columns, convert to float
            processed_data.append(pd.to_numeric(series, errors='coerce').fillna(0))
        elif is_timestamp_column(df[column]):
            # For timestamp columns, convert to unix timestamp
            timestamps = pd.to_datetime(series, errors='coerce')
            processed_data.append(timestamps.astype('int64') // 10**9)
        else:
            # For categorical columns, use label encoding
            label_encoders[column] = LabelEncoder()
            processed_data.append(label_encoders[column].fit_transform(series))
    
    # Stack all processed columns
    return np.column_stack(processed_data), label_encoders

def is_numeric_column(series):
    """Check if a column contains numeric data."""
    try:
        pd.to_numeric(series, errors='raise')
        return True
    except:
        return False

def is_timestamp_column(series):
    """Check if a column contains timestamp data."""
    try:
        pd.to_datetime(series, errors='raise')
        return True
    except:
        return False

def calculate_column_stats(df):
    """Calculate statistics for each column."""
    stats = {}
    for column in df.columns:
        if is_numeric_column(df[column]):
            stats[column] = {
                'type': 'numeric',
                'mean': float(df[column].mean()),
                'std': float(df[column].std()),
                'min': float(df[column].min()),
                'max': float(df[column].max())
            }
        else:
            value_counts = df[column].value_counts()
            stats[column] = {
                'type': 'categorical',
                'unique_values': len(value_counts),
                'top_values': value_counts.head(5).to_dict()
            }
    return stats

def analyze_logs(log_file):
    """Analyze any type of log file."""
    try:
        # Load the data
        if log_file.endswith('.csv'):
            df = pd.read_csv(log_file)
        else:
            # For non-CSV files, try to parse as text logs
            with open(log_file, 'r') as f:
                lines = f.readlines()
            parsed_logs = []
            for line in lines:
                try:
                    # Try to parse JSON
                    parsed = json.loads(line)
                except:
                    # If not JSON, split by common delimiters
                    parts = re.split(r'[\t|,]', line.strip())
                    parsed = {f'field_{i}': part for i, part in enumerate(parts)}
                parsed_logs.append(parsed)
            df = pd.DataFrame(parsed_logs)

        # Calculate basic statistics
        column_stats = calculate_column_stats(df)
        
        # Preprocess the data
        features, label_encoders = preprocess_dynamic_data(df)
        
        # Normalize features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Prepare sequences for LSTM
        sequence_length = min(10, len(features_scaled) - 1)  # Adjust sequence length based on data size
        n_features = features_scaled.shape[1]
        
        # Create sequences
        sequences = []
        for i in range(len(features_scaled) - sequence_length + 1):
            sequences.append(features_scaled[i:i + sequence_length])
        sequences = np.array(sequences)
        
        # Convert to tensor
        sequences = tf.convert_to_tensor(sequences, dtype=tf.float32)
        
        # Initialize and train the model
        model = LogAnalysisModel(sequence_length, n_features)
        model.train(sequences, epochs=5)  # Quick training for demonstration
        
        # Get predictions
        anomaly_scores = model.get_anomaly_score(sequences)
        anomalies = model.detect_anomalies(sequences)
        confidence_scores = model.get_confidence_scores(sequences)
        
        # Convert to numpy arrays
        anomaly_scores = anomaly_scores.numpy()
        anomalies = anomalies.numpy()
        confidence_scores = confidence_scores.numpy()
        
        # Calculate total anomalies
        total_anomalies = int(np.sum(anomalies))
        
        # Prepare results
        results = {
            'total_logs': len(df),
            'total_anomalies': total_anomalies,
            'anomaly_scores': anomaly_scores.tolist(),
            'confidence_scores': confidence_scores.tolist(),
            'column_stats': column_stats,
            'anomalies': [],
            'timestamps': df.index.astype(str).tolist(),
            'recommendations': []
        }
        
        # Add detected anomalies with context
        for i, is_anomaly in enumerate(anomalies):
            if is_anomaly == 1:
                anomaly_context = {}
                for column in df.columns:
                    anomaly_context[column] = str(df.iloc[i][column])
                
                results['anomalies'].append({
                    'index': int(i),
                    'timestamp': str(df.index[i]),
                    'anomaly_score': float(anomaly_scores[i]),
                    'confidence': float(confidence_scores[i]),
                    'context': anomaly_context,
                    'description': f'Anomaly detected in log entry {i}',
                    'severity': 'High' if anomaly_scores[i] > 0.8 else 'Medium',
                    'action': 'Investigate unusual pattern in log entry'
                })
        
        # Add recommendations based on findings
        if results['total_anomalies'] > 0:
            results['recommendations'].append({
                'title': 'Anomalies Detected',
                'description': f'Found {total_anomalies} anomalies in the logs. Review the anomaly details for more information.'
            })
        
        # Add column-specific recommendations
        for column, stats in column_stats.items():
            if stats['type'] == 'numeric':
                if stats['std'] > stats['mean'] * 2:  # High variance
                    results['recommendations'].append({
                        'title': f'High Variance in {column}',
                        'description': f'The column {column} shows high variance. Consider investigating unusual patterns.'
                    })
        
        return results
        
    except Exception as e:
        print(f"Error in log analysis: {str(e)}")
        raise Exception(f"Failed to analyze logs: {str(e)}")

def save_model(model, filename):
    """Save the trained model."""
    model_dir = 'saved_models'
    os.makedirs(model_dir, exist_ok=True)
    model.save_model(os.path.join(model_dir, filename))

def load_model(filename, sequence_length, n_features):
    """Load a saved model."""
    model_path = os.path.join('saved_models', filename)
    if os.path.exists(model_path):
        return LogAnalysisModel.load_model(model_path, sequence_length, n_features)
    return None
