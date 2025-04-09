#!/bin/bash

# Check dependencies for libnut.node in a Node.js environment
ldd ./node_modules/@computer-use/libnut-linux/build/Release/libnut.node 2>/dev/null || echo "libnut.node not found or not supported on this platform"