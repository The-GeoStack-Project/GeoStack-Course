#!/bin/sh

echo "-------------->>>> Cleaning system <<<<--------------"
sleep 2

# Run apt autoremove to remove the unnecessary packages.
sudo apt autoremove

echo "-------------->>>> Running bleachbit to wipe unnecessary files<<<<--------------"
sleep 2

# Run bleachbit list to print all available cleaning options.
# Then select them all execpt for the free_disk_space option (This takes way to long)
# Run bleachbit using the selected cleaning options.
bleachbit --list | grep -E "[a-z0-9_\-]+\.[a-z0-9_\-]+" | grep -v system.free_disk_space | xargs sudo bleachbit --clean

echo "-------------->>>> Running bleachbit for second time in case memory wipe failed<<<--------------"
sleep 2

# Run bleachbit second time in-case the first time fails with ERROR:
# "UnboundLocalError: local variable '_' referenced before assignment" 
bleachbit --list | grep -E "[a-z0-9_\-]+\.[a-z0-9_\-]+" | grep -v system.free_disk_space | xargs sudo bleachbit --clean

echo "-------------->>>> DONE <<<<--------------"
