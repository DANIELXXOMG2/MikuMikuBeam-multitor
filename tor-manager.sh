#!/bin/bash

# Function to display the main menu
show_menu() {
    echo "======================================"
    echo "      TOR Instance Manager"
    echo "======================================"
    echo "1. Set TOR Instances"
    echo "2. View Current TOR Instances"
    echo "3. Exit"
    echo "--------------------------------------"
}

# Function to set the number of TOR instances
set_tor_instances() {
    read -p "Enter the number of TOR instances to use: " instances

    if ! [[ "$instances" =~ ^[0-9]+$ ]]; then
        echo "Error: Please enter a valid number."
        return
    fi

    # Update the .env file
    if grep -q "^TOR_INSTANCES=" .env; then
        sed -i "s/^TOR_INSTANCES=.*/TOR_INSTANCES=$instances/" .env
    else
        echo "TOR_INSTANCES=$instances" >> .env
    fi

    echo "TOR instances set to $instances."
}

# Function to view the current number of TOR instances
view_tor_instances() {
    if [ -f .env ] && grep -q "^TOR_INSTANCES=" .env; then
        current_instances=$(grep "^TOR_INSTANCES=" .env | cut -d '=' -f2)
        echo "Current number of TOR instances: $current_instances"
    else
        echo "TOR instances not set. Defaulting to 1."
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Select an option: " choice

    case $choice in
        1)
            set_tor_instances
            ;;
        2)
            view_tor_instances
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac

    echo
done