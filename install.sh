#!/bin/bash

# Function to build and start game nodes
install_go() {
    echo "Installing Go dependencies..."
    cd go
    go mod tidy
    echo "Done."
}

# Function to build and start game nodes
install_node() {
    echo "Installing Node dependencies..."
    cd node
    npm install
    echo "Done."
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


