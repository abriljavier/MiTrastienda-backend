import random

def generate_numbers():
    numbers = []
    for _ in range(27):  # Generar 27 números
        # Generar un número de cinco cifras y añadir '84' al principio
        number = 8400000 + random.randint(0, 99999)
        numbers.append(number)
    return numbers

# Llamar a la función y obtener la lista de números
generated_numbers = generate_numbers()

# Imprimir los números generados
for num in generated_numbers:
    print(num)
