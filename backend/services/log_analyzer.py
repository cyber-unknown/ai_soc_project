import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
from datetime import datetime

def analyze_logs(log_file):
    try:
        # Load the logs
        logs = pd.read_csv(log_file, parse_dates=['timestamp'])
        
        # Extract features
        features = logs[['timestamp']].copy()
        
        # Convert timestamp to numeric (seconds since epoch)
        features['timestamp'] = features['timestamp'].astype('int64') // 10**9
        
        # Check if IP columns exist and convert them to numeric if they do
        if 'source_ip' in logs.columns:
            features['source_ip_num'] = logs['source_ip'].apply(lambda x: int(''.join([f"{int(i):03d}" for i in x.split('.')])))
        if 'destination_ip' in logs.columns:
            features['destination_ip_num'] = logs['destination_ip'].apply(lambda x: int(''.join([f"{int(i):03d}" for i in x.split('.')])))
        
        # Normalize features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Anomaly detection with Isolation Forest
        model = IsolationForest(contamination=0.1, random_state=42)
        anomalies = model.fit_predict(features_scaled)
        
        # Analyze results
        anomaly_logs = logs[anomalies == -1]
        
        # Count occurrences of each event type
        event_types = logs['event_type'].value_counts().to_dict() if 'event_type' in logs.columns else {}
        
        # Count occurrences of each action
        actions = logs['action'].value_counts().to_dict() if 'action' in logs.columns else {}
        
        # Identify top 5 active users
        top_users = logs['user_id'].value_counts().head(5).to_dict() if 'user_id' in logs.columns else {}
        
        # Calculate time range
        time_range = {
            'start': logs['timestamp'].min().strftime('%Y-%m-%d %H:%M:%S'),
            'end': logs['timestamp'].max().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Identify unique protocols
        protocols = logs['protocol'].unique().tolist() if 'protocol' in logs.columns else []
        
        # Count successful vs. failed actions
        if 'action' in logs.columns:
            action_status = logs['action'].apply(lambda x: 'Success' if x == 'SUCCESS' else 'Failure').value_counts().to_dict()
        else:
            action_status = {}
        
        return {
            "total_logs": len(logs),
            "anomalies": int(np.sum(anomalies == -1)),
            "event_types": event_types,
            "actions": actions,
            "top_users": top_users,
            "time_range": time_range,
            "protocols": protocols,
            "action_status": action_status
        }
    except Exception as e:
        raise Exception(f"Error in log analysis: {str(e)}")
