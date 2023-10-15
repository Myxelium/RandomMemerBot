#!/bin/bash

# Generate a private key
openssl genrsa -out key.pem 2048

# Generate a CSR using the private key
openssl req -new -key key.pem -out csr.pem

# Generate a certificate using the private key and CSR
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# Delete the CSR, we don't need it anymore
rm csr.pem