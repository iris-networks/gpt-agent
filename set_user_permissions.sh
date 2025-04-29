#!/bin/bash
#set -e     # do not use
#set -u     # do not use

main() {
    local verbose=""

    if [[ -n "${DEBUG}" ]] ; then
        echo "Current user: $(id -u):$(id -g)"
        verbose="-v"
    fi

    ### Fix file permissions
    for i in "$@" ; do

        if [[ -n "${verbose}" ]] ; then

            echo "Fixing permissions for: ${i}"
        fi

        ### set directory permissions
        ### recursively, but skipping dot-directories in $HOME
        find "$i" -type d -not -path "${HOME}/.*" -exec chmod ${verbose} 755 {} +

        ### set file permissions
        ### recursively, but skipping dot-files and dot-directories in $HOME
        find "$i" -type f -not -path "${HOME}/.*" -exec chmod ${verbose} 644 {} +

        ### specific file permissions
        ### recursively, but skipping dot-directories in $HOME
        find "$i"/ -type f -not -path "${HOME}/.*" -name '*.sh' -exec chmod ${verbose} 744 {} +
        find "$i"/ -type f -not -path "${HOME}/.*" -name '*.desktop' -exec chmod ${verbose} 744 {} +
    done

    ### startup script is special
    chmod 755 "${STARTUPDIR}"/startup.sh
    
    ### Restrict /app directory for non-root users
    if [[ -d "/app" ]]; then
        if [[ -n "${verbose}" ]]; then
            echo "Restricting /app directory access for non-root users"
        fi
        
        # Ensure ACL package is available
        if ! command -v setfacl &> /dev/null; then
            echo "ACL package not found, attempting to install..."
            apt-get update && apt-get install -y acl || {
                echo "Failed to install ACL package, using standard permissions"
                # Set strict permissions for non-hidden files in /app
                find /app -not -path "*/\.*" -type f -exec chmod 600 {} \;
                find /app -not -path "*/\.*" -type d -exec chmod 700 {} \;
                # Ensure root ownership
                find /app -not -path "*/\.*" -exec chown root:root {} \;
            }
        else
            # Apply ACL restrictions for all users except root
            for user in $(cut -d: -f1 /etc/passwd); do
                # Skip root user
                if [[ "$user" != "root" ]]; then
                    # Deny access to non-hidden files and directories in /app for this user
                    find /app -not -path "*/\.*" -type f -exec setfacl -m u:${user}:--- {} \;
                    find /app -not -path "*/\.*" -type d -exec setfacl -m u:${user}:--- {} \;
                fi
            done
            
            # Set default ACLs for directories to ensure new files inherit restrictions
            find /app -not -path "*/\.*" -type d -exec setfacl -d -m o::--- {} \;
            
            echo "ACL restrictions applied: non-root users are denied access to non-hidden files in /app"
        fi
    fi
}

main $@