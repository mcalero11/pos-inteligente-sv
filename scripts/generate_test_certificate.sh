#!/bin/bash

# Script to generate a test certificate for the svfe-api-firmador project
# Usage: ./generate_test_certificate.sh [NIT] [private_key_password]

# Default values
NIT=${1:-"12345678901234"}
PRIVATE_PASSWORD=${2:-"test123"}
PUBLIC_PASSWORD="public123"

echo "Generating test certificate for NIT: $NIT"
echo "Private key password: $PRIVATE_PASSWORD"

# Hardcoded RSA key pair (2048-bit) - Base64 encoded DER format
# These are test keys - DO NOT use in production!

# Private key (PKCS#8 format)
PRIVATE_KEY_B64="MIIEwAIBADANBgkqhkiG9w0BAQEFAASCBKowggSmAgEAAoIBAQCoJdrM7gRYxzicb4v38AtAfq7E4Rv90rtuXk96fDGIO4d9YHUMam5ZmrFFkK4PBAErm5dmMj1IWzX1u7/L4Gqe63MXbg0lcfbWJhIw3YHXPhqQo8vHgsXs6znRviwAEVm5TS6emm1dcnVJ3MO26npob4RdILvjzT63AdPVoeLVc9Y0f/agqaiOQCgEbMGa53ueVT/9+m2fn2xxefYN5A8isFaBuegSiaNUYMwA8SrgjWweU8M6g2t8fcMtSOqydNKvzRrZ6ZLGfqrnVj6IEA+0tT+K8I4NiJtBjKrbRHqYZtkpWuwt8eGOzygyBUmV+uSbeycqp30phQ6kC7hGIqe7AgMBAAECggEBAIH7CUFjON772cor/FIEMF6Bz04ICeBTV2pA40V23b9G7TzBJJodaAJCL4jsB3E6EkGIfCeW7IKTZ4n2wZOzfhgtQAG7o9PvXfU65tL5WBZwPo7S34Lxl1jGmSKG1HKU9vvkKwaVr7cN9JbNXkl2xnsWwYZP+I5nKXTEp+E7zCJdsTxI4SCcmULdvTQhyXzmceAw2O2mepNZ+Z64D+g4VwEcV82Lh6nXptXl4FniTrMD0vC/vYP1qkt7obhSBAPQZRFVrJjI9SmtcACM+rzCzfr9MgKkLtypCwfhbwrmnD/vsVFZy9kRg0g+/vfzLiNNLGLw5DlhGj5OkoDzeL+v9TkCgYEA1GnPucwwuPzQTUJic3nmEI2y8LrnuW5vgRFIkJ02C4kZM9qT/Wa/9sXBtmqstiOfLAD1OL4nMwRJyRBwq2MSE1KkJ1pkAd4EK+OM6NzPJh2RQmeEZYuNe2IkOIugdqUBZ76oVZnWfRPyc9dfPGJn99iyhH8hfMOzwqxGlaiJcu8CgYEAyqbBKzZIkTev5fygh06zsjX1VUH0SZxofsOOObF14cv+h31yjB+03yWeET9b9Jo7lwBlWKXKXSPMw7HuNjxEdZGB4K7JWt2zuag+KwvrIXWm89iraV8Ro1eTYkkk3wY4Pvcn21KqkWi8IrTBqWspnihm8O67/zKzSrT7acI+5/UCgYEAzUNvFCnIz4qnNHG5N8QNWePEjrLfKKcao4vzJqR1TJJww1Yu+oonaS3TMxdEzUIBGAHY9rtyn+896kmzxzsWhYuvy8OirtdACrV7Pq/akgeyjowAOiywTRIa1HXBW8W6ZOmuPAJMblQvUFhI1M53j99dK4K69pkbhjz6fLcAFAsCgYEAnudFHxowqtYMsn12bsLyuvH+jrzpzfK8KXI0Ct8xPT3VNu7SLDgMftGjcYjKFTH/OfeQgIN3+7K/tE/IJ3T4hWv0eHb14q9nZ1Qac2ykEheMMzcZqcVnMjrQkcgjBlJ9NjpdYWgf4WdL5rbwCGXEO4UYuyGn/oMF/bWOUq6C3yUCgYEAp00QIFovedelbNL388B7pgHfc6DdrRhx6wDEtlnack/dy5G5v3QqVlKkpRijxqrRQdAsFEL8eerR6GXKu5KNfwGLqV+EEn+cVL3x52ruscpD3No5IV3yZPbvEIeBh0eHs35K1fnWCJQcQ27nYqsGN5Rdjjr/qmnzY57+i7qJxOQ="

# Public key (X.509 format)  
PUBLIC_KEY_B64="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqCXazO4EWMc4nG+L9/ALQH6uxOEb/dK7bl5PenwxiDuHfWB1DGpuWZqxRZCuDwQBK5uXZjI9SFs19bu/y+BqnutzF24NJXH21iYSMN2B1z4akKPLx4LF7Os50b4sABFZuU0unpptXXJ1SdzDtup6aG+EXSC7480+twHT1aHi1XPWNH/2oKmojkAoBGzBmud7nlU//fptn59scXn2DeQPIrBWgbnoEomjVGDMAPEq4I1sHlPDOoNrfH3DLUjqsnTSr80a2emSxn6q51Y+iBAPtLU/ivCODYibQYyq20R6mGbZKVrsLfHhjs8oMgVJlfrkm3snKqd9KYUOpAu4RiKnuwIDAQAB"

# Generate SHA512 hashes of passwords
PRIVATE_HASH=$(echo -n "$PRIVATE_PASSWORD" | openssl dgst -sha512 | cut -d' ' -f2)
PUBLIC_HASH=$(echo -n "$PUBLIC_PASSWORD" | openssl dgst -sha512 | cut -d' ' -f2)

# Get current date for certificate
CURRENT_DATE=$(date -u +"%Y-%m-%dY%H:%M:%S.%3NZ")

# Generate random MongoDB-style ID
MONGO_ID=$(openssl rand -hex 12)

# Generate epoch timestamps for validity
CURRENT_EPOCH=$(date +%s)
FUTURE_EPOCH=$((CURRENT_EPOCH + 31536000)) # +1 year

# Generate the XML certificate (single line, no formatting like the working example)
# Use simple epoch seconds for Jackson to parse as Instant
# Use correct SHA512 hash of the password for the private key clave field
cat > "${NIT}.crt" << EOF
<CertificadoMH><_id>$MONGO_ID</_id><nit>$NIT</nit><publicKey><keyType>PUBLIC</keyType><algorithm>RSA</algorithm><encodied>$PUBLIC_KEY_B64</encodied><format>X.509</format><clave>$PUBLIC_HASH</clave></publicKey><privateKey><keyType>PRIVATE</keyType><algorithm>RSA</algorithm><encodied>$PRIVATE_KEY_B64</encodied><format>PKCS#8</format><clave>$PRIVATE_HASH</clave></privateKey><activo>true</activo><certificado><basicEstructure><version>2</version><serial>1.2.840.113549.1.1.11</serial><signatureAlgorithm><algorithm>Sha256WithRSAEncryption</algorithm><parameters/></signatureAlgorithm><issuer><countryName>SV</countryName><localilyName>SAN SALVADOR</localilyName><organizationalUnit>MINISTERIO DE HACIENDA</organizationalUnit><organizationalName>DIRECCIÓN GENERAL DE IMPUESTOS INTERNOS</organizationalName><commonName>UNIDAD COORDINADORA DEL PROGAMA FORTALECIMIENTO A LA ADMINISTRACIÓN TRIBUTARÍA</commonName><organizationIdentifier>VATSV-0614-010111-003-2</organizationIdentifier></issuer><validity><notBefore>$CURRENT_EPOCH</notBefore><notAfter>$FUTURE_EPOCH</notAfter></validity><subject><countryName>El Salvador</countryName><organizationName>TEST COMPANY</organizationName><organizationUnitName>TEST DEPARTMENT</organizationUnitName><organizationIdentifier>VATSV$NIT</organizationIdentifier><surname>TEST</surname><givenName>USER</givenName><commonName>test</commonName><description>9999999</description></subject><subjectPublicKeyInfo><algorithmIdenitifier><algorithm>RSA</algorithm><parameters/></algorithmIdenitifier><subjectPublicKey>$PUBLIC_KEY_B64</subjectPublicKey></subjectPublicKeyInfo></basicEstructure><extensions><authorityKeyIdentifier><keyIdentifier>$MONGO_ID</keyIdentifier></authorityKeyIdentifier><subjectKeyIdentifier><keyIdentifier>${MONGO_ID}aa</keyIdentifier></subjectKeyIdentifier><keyUsage><digitalSignature>1</digitalSignature><contentCommintment>1</contentCommintment><dataEncipherment>0</dataEncipherment><keyAgreement>0</keyAgreement><keyCertificateSignature>0</keyCertificateSignature><crlSignature>0</crlSignature><encipherOnly>0</encipherOnly><decipherOnly>0</decipherOnly></keyUsage><certificatePolicies><policyInformations/></certificatePolicies><subjectAlternativeNames><rfc822Name>test@company.com</rfc822Name></subjectAlternativeNames><extendedKeyUsage><clientAuth></clientAuth><emailProtection></emailProtection></extendedKeyUsage><crlDistributionPoint><distributionPoint><distributionPoint>http://www2.mh.gob.sv/crl</distributionPoint><distributionPoint>http://www2.mh.gob.sv/crl2</distributionPoint></distributionPoint></crlDistributionPoint><authorityInfoAccess><accessDescription><accessDescription><accessMethod></accessMethod><accessLocation><accessLocation>https://www.minec.gob.sv/ca/public/donwload/subordinadal.crt</accessLocation></accessLocation></accessDescription></accessDescription></authorityInfoAccess><qualifiedCertificateStatements><qcCompliance></qcCompliance><qcEuRetentionPeriod>10</qcEuRetentionPeriod><qcPDS><pdsLocation/><url>https://www2.mh.gob.sv/pds</url><language>ES</language></qcPDS><qcType>id-etsi-qct-esign</qcType></qualifiedCertificateStatements><basicConstraints><ca>false</ca></basicConstraints></extensions></certificado><clavePub/><clavePri/></CertificadoMH>
EOF

# Certificate generated in current directory

echo ""
echo "✅ Certificate generated successfully!"
echo "📁 File: ${NIT}.crt"
echo "🔑 NIT: $NIT"
echo "🔒 Private Key Password: $PRIVATE_PASSWORD"
echo "🔓 Public Key Password: $PUBLIC_PASSWORD"
echo ""
echo "📋 Test API Request:"
echo "curl -X POST http://localhost:8113/firma/firmardocumento/ \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"nit\": \"$NIT\","
echo "    \"passwordPri\": \"$PRIVATE_PASSWORD\","
echo "    \"dteJson\": {\"test\": \"document\"}"
echo "  }'"
echo ""
echo "📂 Copy this file to your application's upload directory" 
