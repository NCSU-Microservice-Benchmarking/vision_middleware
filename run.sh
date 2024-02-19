#!/bin/bash

# Function to build and start game nodes
start_go() {
    echo "Starting Go environment..."
    cd go/units/latent-generation
    go run main.go
    #cd ../pose-latent-combination
    #go run main.go
    #cd ../segment-new-instance-combination
    #go run main.go
    echo "Go environment closed."
}

# Function to build and start game nodes
start_node() {
    echo "Starting Node environment..."
    cd node
    npm run dev
    echo "Node environment closed."
}

# Check parameter and start the corresponding part
if [ "$1" = "go" ]; then
    start_go
elif [ "$1" = "node" ]; then
    start_node
else
    echo "Invalid parameter. Please specify 'go' or 'node'."
    exit 1
fi


