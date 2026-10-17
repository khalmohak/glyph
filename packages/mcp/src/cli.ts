#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createGlyphServer } from './server'

// stdout carries the protocol; nothing else may write to it.
await createGlyphServer().connect(new StdioServerTransport())
