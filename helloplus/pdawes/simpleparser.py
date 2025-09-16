import numpy as np
import re

regex = r"\w+"

def parse(text):
    matches = re.findall(regex, text)
    tokens = np.array(matches)
    unique, counts = np.unique(tokens, return_counts=True)
    word_count = {word: count for word, count in zip(unique, counts)}
    return word_count

if __name__ == "__main__":
    input_file = input("Enter path to file: ")
    with open(input_file, 'r', encoding='utf-8') as file:
        text = file.read()
    text = text.lower()
    tokens = parse(text)
    
    for word, count in tokens.items():
        print(f"{word}: {count}")
