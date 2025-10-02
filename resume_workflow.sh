#!/bin/bash

# Load configuration
CONFIG_FILE="workflow_config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Configuration file $CONFIG_FILE not found!"
    exit 1
fi

# Extract parameters using node
dry_run=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.dry_run);
")
log_dir=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.log_dir);
")
max_logs=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.max_logs);
")
backup_count=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.backup_count);
")
retry_attempts=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.retry_attempts || 3);
")
retry_delay=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.retry_delay || 5);
")
pre_hook=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.hooks?.pre_execution || '');
")
post_hook=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.hooks?.post_execution || '');
")

# Extract arrays
files_to_update=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.files_to_update.join(' '));
")
prod_deps=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.dependencies.production.join(' '));
")
dev_deps=$(node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    console.log(config.dependencies.development.join(' '));
")

# Set up logging
LOG_FILE=${log_dir}/zetav10_$(date +'%Y%m%d_%H%M%S').log

# Set up logging
LOG_FILE=${log_dir}/zetav10_$(date +'%Y%m%d_%H%M%S').log

# Function to validate environment
validate_environment() {
    echo "Validating environment..."
    command -v npm >/dev/null 2>&1 || { echo "npm not found"; exit 1; }
    command -v git >/dev/null 2>&1 || { echo "git not found"; exit 1; }
    command -v node >/dev/null 2>&1 || { echo "node not found"; exit 1; }
    # curl is optional, only needed for URL-based file replacements
    echo "Environment validation passed."
}

# Function to retry commands
retry_command() {
    local cmd="$1"
    local max_attempts=$retry_attempts
    local delay=$retry_delay
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts: $cmd"
        if eval "$cmd"; then
            return 0
        else
            echo "Command failed, retrying in $delay seconds..."
            sleep $delay
            ((attempt++))
        fi
    done

    echo "Command failed after $max_attempts attempts"
    return 1
}

# Function to measure execution time
time_command() {
    local start=$(date +%s.%3N)
    "$@"
    local end=$(date +%s.%3N)
    local duration=$(echo "$end - $start" | bc)
    echo "Duration: ${duration}s"
}

# Function to run hooks
run_hook() {
    local hook_script="$1"
    if [ -n "$hook_script" ] && [ -f "$hook_script" ]; then
        echo "Running hook: $hook_script"
        chmod +x "$hook_script"
        ./"$hook_script" || echo "Hook $hook_script failed, continuing..."
    fi
}

# Function to notify failure
notify_failure() {
    MESSAGE="$1"
    echo "$MESSAGE"
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$MESSAGE\"}" $SLACK_WEBHOOK_URL
    fi
    if command -v notify-send >/dev/null 2>&1; then
        notify-send 'ZetaV10 Update Failure' "$MESSAGE"
    fi
    if [ ! -z "$EMAIL_TO" ]; then
        node -e "
            const nodemailer = require('nodemailer');
            const fs = require('fs');
            (async () => {
                let transporter = nodemailer.createTransporter({
                    host: '$EMAIL_SERVER',
                    port: 587,
                    secure: false,
                    auth: { user: '$EMAIL_USER', pass: '$EMAIL_PASS' }
                });
                let report = fs.readFileSync('$LOG_FILE', 'utf8');
                await transporter.sendMail({
                    from: '$EMAIL_FROM',
                    to: '$EMAIL_TO',
                    subject: 'ZetaV10 Update Failure',
                    text: '$MESSAGE'
                });
            })();
        "
    fi
}

# Function to install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    if [ "$DRY" = "false" ]; then
        time_command retry_command "npm install $prod_deps" || { notify_failure "Production dependency installation failed"; exit 1; }
        time_command retry_command "npm install --save-dev $dev_deps" || { notify_failure "Dev dependency installation failed"; exit 1; }
    else
        echo 'Dry-run: would install dependencies'
    fi
}

# Function to replace files
replace_files() {
    echo "Replacing files..."
    for file in $files_to_update; do
        replacement=$(node -e "
            const fs = require('fs');
            const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
            const rep = config.file_replacements['$file'];
            if (rep) {
                if (rep.source === 'url') {
                    console.log('url:' + rep.url);
                } else if (rep.source === 'inline') {
                    console.log('inline:' + rep.content);
                }
            } else {
                console.log('none');
            }
        ")
        if [ "$replacement" != "none" ]; then
            if [ "$DRY" = "false" ]; then
                if [[ $replacement == url:* ]]; then
                    url=${replacement#url:}
                    echo "Downloading $file from $url"
                    time_command retry_command "curl -s -o '$file' '$url'" || { notify_failure "Failed to download $file"; exit 1; }
                elif [[ $replacement == inline:* ]]; then
                    content=${replacement#inline:}
                    echo "Replacing $file with inline content"
                    echo -e "$content" > "$file"
                fi
            else
                echo "Dry-run: would replace $file"
            fi
        else
            echo "No replacement defined for $file"
        fi
    done
}

# Function to run quality checks
run_quality_checks() {
    echo "Running linting..."
    if [ "$DRY" = "false" ]; then
        npm run lint || { notify_failure 'Lint failed — rolling back'; cp -r $(cat .last_backup)/* .; exit 1; }
    fi

    echo "Running formatting..."
    if [ "$DRY" = "false" ]; then
        npm run format || { notify_failure 'Format failed — rolling back'; cp -r $(cat .last_backup)/* .; exit 1; }
    fi

    echo "Running tests..."
    if [ "$DRY" = "false" ]; then
        npm test || { notify_failure 'Tests failed — rolling back'; cp -r $(cat .last_backup)/* .; exit 1; }
    fi
}

# Function to commit and push
commit_and_push() {
    echo "Committing and pushing..."
    if [ "$DRY" = "false" ]; then
        git add . && git commit -m 'Update ZetaV10 components' && git push || notify_failure 'Commit/Push failed'
    fi
}

# Function to clean up
cleanup() {
    echo "Cleaning old backups..."
    if [ "$DRY" = "false" ]; then
        ls -1dt backup/* 2>/dev/null | tail -n +$((backup_count + 1)) | xargs -r rm -rf
    fi

    echo "Cleaning old logs..."
    ls -1dt ${log_dir}/* 2>/dev/null | tail -n +$((max_logs + 1)) | xargs -r rm -f
}

# Function to send summary report
send_summary_report() {
    echo "Emailing summary report..."
    if [ ! -z "$EMAIL_TO" ]; then
        node -e "
            const nodemailer = require('nodemailer');
            const fs = require('fs');
            (async () => {
                let transporter = nodemailer.createTransporter({
                    host: '$EMAIL_SERVER',
                    port: 587,
                    secure: false,
                    auth: { user: '$EMAIL_USER', pass: '$EMAIL_PASS' }
                });
                let report = fs.readFileSync('$LOG_FILE', 'utf8');
                await transporter.sendMail({
                    from: '$EMAIL_FROM',
                    to: '$EMAIL_TO',
                    subject: 'ZetaV10 Update Summary',
                    text: report
                });
            })();
        "
    fi
}

# Main execution with logging
(

    run_hook "$pre_hook"

    validate_environment

    DRY=$dry_run
    echo "Dry-run mode: $DRY"

    mkdir -p logs backup dashboard/src dashboard/public

    if [ "$DRY" = "false" ] && [ -n "$(git status --porcelain)" ]; then
        notify_failure 'Uncommitted changes detected — aborting update'
        exit 1
    else
        echo 'Dry-run: would check git status'
    fi

    TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
    BACKUP_DIR=backup/$TIMESTAMP
    echo "Backup dir: $BACKUP_DIR"
    if [ "$DRY" = "false" ]; then
        mkdir -p $BACKUP_DIR && echo $BACKUP_DIR > .last_backup
    else
        echo 'Dry-run: would create backup'
    fi

    for f in $files_to_update; do
        if [ "$DRY" = "false" ]; then
            cp "$f" $BACKUP_DIR/
        else
            echo "Dry-run: would backup $f"
        fi
    done

    time_command install_dependencies
    time_command replace_files
    time_command run_quality_checks
    time_command commit_and_push
    time_command cleanup

    echo '----- SUMMARY REPORT -----'
    echo "Files updated: $files_to_update"
    echo "Backup: $BACKUP_DIR"
    echo "Log: $LOG_FILE"
    echo '--------------------------'

    time_command send_summary_report

    run_hook "$post_hook"

    # Update status to completed
    echo '{"status":"completed","message":"Workflow completed successfully","timestamp":"'$(date -Iseconds)'"}' > workflow_status.json

) | tee -a $LOG_FILE