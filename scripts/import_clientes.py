import os
import csv
from urllib.request import urlopen
from supabase import create_client

# Supabase configuration
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found")
    exit(1)

# Create Supabase client
supabase = create_client(supabase_url, supabase_key)

# CSV URL
csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/clientes_rows-A2Fk5crwCNmKAO5BiZkxDcWIm2bfX1.csv"

print("Downloading CSV...")
response = urlopen(csv_url)
csv_data = response.read().decode('utf-8')

print("Parsing CSV...")
csv_reader = csv.DictReader(csv_data.splitlines())

clientes = []
for row in csv_reader:
    cliente = {
        'id': row['id'],
        'nome': row['nome'],
        'cpf': row['cpf'],
        'telefone': row['telefone'],
        'email': row['email'],
        'rua': row['rua'],
        'numero': row['numero'],
        'complemento': row['complemento'],
        'bairro': row['bairro'],
        'cidade': row['cidade'],
        'estado': row['estado'],
        'cep': row['cep'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
        'ano_nascimento': None  # Will be filled later if needed
    }
    clientes.append(cliente)

print(f"Found {len(clientes)} clients to import")

# Insert data in batches
batch_size = 100
for i in range(0, len(clientes), batch_size):
    batch = clientes[i:i + batch_size]
    print(f"Inserting batch {i//batch_size + 1}...")
    
    result = supabase.table('clientes').insert(batch).execute()
    
    if result.data:
        print(f"Successfully inserted {len(result.data)} clients")
    else:
        print(f"Error inserting batch: {result}")

print("Import completed!")
