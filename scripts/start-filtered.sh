#!/bin/bash
# Start server with filtered output to suppress RPC "filter not found" errors

npm run dev 2>&1 | grep -v "filter not found" | grep -v "could not coalesce error" | grep -v "eth_getFilterChanges"

