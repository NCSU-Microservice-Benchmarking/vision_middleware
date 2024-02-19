#!/bin/bash

install_go() {
    echo "Installing Go dependencies..."
    cd go
    go mod tidy
    echo "Done."
}

install_node() {
    echo "Installing Node dependencies..."
    cd node
    npm install
    echo "Done."
}

if [ "$1" = "go" ]; then
    start_go
elif [ "$1" = "node" ]; then
    start_node
else
    echo "Invalid parameter. Please specify 'go' or 'node'."
    exit 1
fi


