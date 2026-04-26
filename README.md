# British Auction RFQ System

A simplified RFQ (Request for Quotation) system that supports **British Auction–style bidding** with automatic bid-time extensions, forced close rules, and role-based access for buyers and suppliers.

## Schema Design
- Schema Design link
-  https://app.eraser.io/workspace/GaYNP3KjtEf2qCr4Njy5

## Overview

In a traditional RFQ process, a buyer asks multiple suppliers to submit quotes. This system adds a **British Auction** mechanism where:

- Suppliers submit bids openly and can continuously lower their prices.
- If bidding activity happens close to the auction end time, the auction **automatically extends**.
- The auction has a **forced close time** after which bidding stops regardless.
- This prevents last-second bidding manipulation and encourages fair competition.

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Start development server
npm run dev
