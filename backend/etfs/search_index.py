from elasticsearch import Elasticsearch, exceptions
import json

def create_etf_index(es):
    # Define the index settings and mappings
    body = {
        'settings': {
            "index": {
                "number_of_shards": 1,
                "number_of_replicas": 1
            }
        },
        'mappings': {
            "properties": {
                "name": {"type": "text"},
                "code": {"type": "keyword"},
                "category": {"type": "text"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }
    }
    
    try:
        # Print the body to debug
        print(json.dumps(body, indent=2))
        
        # Create the index with the defined settings and mappings
        es.indices.create(index='etfs', body=body)
        print("Index 'etfs' created successfully.")
    
    except exceptions.RequestError as e:
        if e.error == 'resource_already_exists_exception':
            print("Index 'etfs' already exists.")
        else:
            print(f"Failed to create index: {e}")
    
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Establish a connection to Elasticsearch
    es = Elasticsearch(['http://localhost:9200'])
    
    # Create the ETF index
    create_etf_index(es)
