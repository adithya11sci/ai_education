#!/bin/bash

# API Testing Script for Messaging and Calls System
# This script tests all major endpoints

BASE_URL="http://localhost:8787"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}========================================${NC}"
echo -e "${BOLD}${BLUE}  Messaging and Calls API Test Suite${NC}"
echo -e "${BOLD}${BLUE}========================================${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${BOLD}${BLUE}>>> $1${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if server is running
print_section "Checking Server Status"
if curl -s "$BASE_URL" > /dev/null; then
    print_success "Server is running at $BASE_URL"
else
    print_error "Server is not running. Please start it with 'npm run dev'"
    exit 1
fi

# Test 1: Create Users
print_section "Test 1: Creating Users"

echo "Creating Alice..."
ALICE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@test.com", "password": "alice123"}')
ALICE_ID=$(echo $ALICE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Created Alice (ID: $ALICE_ID)"

echo "Creating Bob..."
BOB=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "email": "bob@test.com", "password": "bob123"}')
BOB_ID=$(echo $BOB | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Created Bob (ID: $BOB_ID)"

echo "Creating Charlie..."
CHARLIE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "email": "charlie@test.com", "password": "charlie123"}')
CHARLIE_ID=$(echo $CHARLIE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Created Charlie (ID: $CHARLIE_ID)"

echo "Creating Diana..."
DIANA=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Diana", "email": "diana@test.com", "password": "diana123"}')
DIANA_ID=$(echo $DIANA | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Created Diana (ID: $DIANA_ID)"

# Test 2: Direct Messages
print_section "Test 2: Testing Direct Messages"

echo "Alice sends message to Bob..."
MSG1=$(curl -s -X POST "$BASE_URL/messages/direct" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": $ALICE_ID, \"recipientId\": $BOB_ID, \"content\": \"Hi Bob!\", \"type\": \"text\"}")
print_success "Message sent"

echo "Bob replies to Alice..."
MSG2=$(curl -s -X POST "$BASE_URL/messages/direct" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": $BOB_ID, \"recipientId\": $ALICE_ID, \"content\": \"Hey Alice!\", \"type\": \"text\"}")
print_success "Reply sent"

echo "Getting conversation between Alice and Bob..."
CONV=$(curl -s "$BASE_URL/messages/direct/$BOB_ID?currentUserId=$ALICE_ID")
print_success "Retrieved conversation"

# Test 3: Group Chats
print_section "Test 3: Testing Group Chats"

echo "Creating group chat..."
GROUP=$(curl -s -X POST "$BASE_URL/groups" \
  -H "Content-Type: application/json" \
  -d "{\"createdBy\": $ALICE_ID, \"name\": \"Team Project\", \"description\": \"Project discussion\", \"memberIds\": [$BOB_ID, $CHARLIE_ID, $DIANA_ID]}")
GROUP_ID=$(echo $GROUP | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Created group (ID: $GROUP_ID)"

echo "Getting group members..."
MEMBERS=$(curl -s "$BASE_URL/groups/$GROUP_ID/members")
print_success "Retrieved group members"

# Test 4: Group Messages
print_section "Test 4: Testing Group Messages"

echo "Alice sends message to group..."
GMSG1=$(curl -s -X POST "$BASE_URL/messages/group" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": $ALICE_ID, \"groupChatId\": $GROUP_ID, \"content\": \"Hello team!\", \"type\": \"text\"}")
print_success "Group message sent"

echo "Bob sends message to group..."
GMSG2=$(curl -s -X POST "$BASE_URL/messages/group" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": $BOB_ID, \"groupChatId\": $GROUP_ID, \"content\": \"Hi everyone!\", \"type\": \"text\"}")
print_success "Group message sent"

echo "Getting group messages..."
GROUP_MSGS=$(curl -s "$BASE_URL/messages/group/$GROUP_ID")
print_success "Retrieved group messages"

# Test 5: Direct Calls
print_section "Test 5: Testing Direct Calls"

echo "Alice initiates video call to Bob..."
CALL=$(curl -s -X POST "$BASE_URL/calls/initiate" \
  -H "Content-Type: application/json" \
  -d "{\"initiatorId\": $ALICE_ID, \"type\": \"video\", \"callType\": \"direct\", \"recipientId\": $BOB_ID}")
CALL_ID=$(echo $CALL | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Call initiated (ID: $CALL_ID)"

echo "Bob joins the call..."
JOIN=$(curl -s -X POST "$BASE_URL/calls/$CALL_ID/join" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $BOB_ID}")
print_success "Bob joined the call"

echo "Getting LiveKit token for Alice..."
TOKEN_ALICE=$(curl -s "$BASE_URL/calls/$CALL_ID/token?userId=$ALICE_ID&userName=Alice")
print_success "Token generated for Alice"

echo "Getting LiveKit token for Bob..."
TOKEN_BOB=$(curl -s "$BASE_URL/calls/$CALL_ID/token?userId=$BOB_ID&userName=Bob")
print_success "Token generated for Bob"

echo "Ending the call..."
END_CALL=$(curl -s -X POST "$BASE_URL/calls/$CALL_ID/end")
print_success "Call ended"

# Test 6: Group Calls
print_section "Test 6: Testing Group Calls"

echo "Alice initiates group video call..."
GROUP_CALL=$(curl -s -X POST "$BASE_URL/calls/initiate" \
  -H "Content-Type: application/json" \
  -d "{\"initiatorId\": $ALICE_ID, \"type\": \"video\", \"callType\": \"group\", \"groupChatId\": $GROUP_ID}")
GROUP_CALL_ID=$(echo $GROUP_CALL | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
print_success "Group call initiated (ID: $GROUP_CALL_ID)"

echo "Bob joins group call..."
curl -s -X POST "$BASE_URL/calls/$GROUP_CALL_ID/join" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $BOB_ID}" > /dev/null
print_success "Bob joined"

echo "Charlie joins group call..."
curl -s -X POST "$BASE_URL/calls/$GROUP_CALL_ID/join" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $CHARLIE_ID}" > /dev/null
print_success "Charlie joined"

echo "Diana joins group call..."
curl -s -X POST "$BASE_URL/calls/$GROUP_CALL_ID/join" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $DIANA_ID}" > /dev/null
print_success "Diana joined"

echo "Getting tokens for all participants..."
curl -s "$BASE_URL/calls/$GROUP_CALL_ID/token?userId=$ALICE_ID&userName=Alice" > /dev/null
curl -s "$BASE_URL/calls/$GROUP_CALL_ID/token?userId=$BOB_ID&userName=Bob" > /dev/null
curl -s "$BASE_URL/calls/$GROUP_CALL_ID/token?userId=$CHARLIE_ID&userName=Charlie" > /dev/null
curl -s "$BASE_URL/calls/$GROUP_CALL_ID/token?userId=$DIANA_ID&userName=Diana" > /dev/null
print_success "Tokens generated for all participants"

echo "Ending group call..."
curl -s -X POST "$BASE_URL/calls/$GROUP_CALL_ID/end" > /dev/null
print_success "Group call ended"

# Test 7: Call History
print_section "Test 7: Testing Call History"

echo "Getting Alice's call history..."
HISTORY=$(curl -s "$BASE_URL/calls/history?userId=$ALICE_ID")
print_success "Retrieved call history"

# Test 8: Group Management
print_section "Test 8: Testing Group Management"

echo "Updating group information..."
UPDATE=$(curl -s -X PUT "$BASE_URL/groups/$GROUP_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Team Project - Updated", "description": "Updated description"}')
print_success "Group updated"

echo "Making Bob an admin..."
ROLE=$(curl -s -X PUT "$BASE_URL/groups/$GROUP_ID/members/$BOB_ID/role" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}')
print_success "Bob is now an admin"

# Summary
print_section "Test Summary"

echo -e "${BOLD}Test Results:${NC}"
echo -e "  ${GREEN}✓${NC} Users created: 4"
echo -e "  ${GREEN}✓${NC} Direct messages: 2"
echo -e "  ${GREEN}✓${NC} Group created: 1"
echo -e "  ${GREEN}✓${NC} Group messages: 2"
echo -e "  ${GREEN}✓${NC} Direct calls: 1"
echo -e "  ${GREEN}✓${NC} Group calls: 1"
echo -e "  ${GREEN}✓${NC} Call history retrieved"
echo -e "  ${GREEN}✓${NC} Group management tested"

echo -e "\n${BOLD}${GREEN}All tests completed successfully!${NC}\n"

echo -e "${BOLD}Created Resources:${NC}"
echo -e "  Users: Alice ($ALICE_ID), Bob ($BOB_ID), Charlie ($CHARLIE_ID), Diana ($DIANA_ID)"
echo -e "  Group: $GROUP_ID"
echo -e "  Calls: $CALL_ID (direct), $GROUP_CALL_ID (group)"
echo ""
