#!/bin/bash
# Generate Protocol Buffer code for all services

echo "🔄 Generating Protocol Buffer code..."

# Check if protoc is installed
if ! command -v protoc &> /dev/null; then
    echo "❌ protoc is not installed. Please install Protocol Buffers compiler."
    exit 1
fi

# Generate Go code
echo "📦 Generating Go code from Protocol Buffers..."
mkdir -p ../backend/pkg/proto
protoc --go_out=../backend/pkg/proto \
       --go_opt=paths=source_relative \
       --go-grpc_out=../backend/pkg/proto \
       --go-grpc_opt=paths=source_relative \
       proto/*.proto

# Generate TypeScript code (if ts-proto is installed)
if command -v protoc-gen-ts &> /dev/null; then
    echo "📦 Generating TypeScript code from Protocol Buffers..."
    mkdir -p types/proto
    protoc --plugin=protoc-gen-ts \
           --ts_out=types/proto \
           proto/*.proto
else
    echo "⚠️  ts-proto not installed. Skipping TypeScript generation."
    echo "   Install with: npm install -g ts-proto"
fi

# Generate Rust code is handled by build.rs in each Rust project
echo "ℹ️  Rust code generation should be configured in desktop/src-tauri/build.rs"

echo "✅ Protocol Buffer generation completed!"
