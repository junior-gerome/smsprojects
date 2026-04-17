#!/usr/bin/env sh
set -eu

APP_HOME=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GRADLE_VERSION=8.10.2
DIST_NAME="gradle-${GRADLE_VERSION}-bin"
DIST_URL="https://services.gradle.org/distributions/${DIST_NAME}.zip"
WRAPPER_HOME="${APP_HOME}/.gradle-wrapper"
DIST_HOME="${WRAPPER_HOME}/dist"
ZIP_FILE="${WRAPPER_HOME}/${DIST_NAME}.zip"
GRADLE_HOME="${DIST_HOME}/gradle-${GRADLE_VERSION}"
GRADLE_CMD="${GRADLE_HOME}/bin/gradle"

if [ ! -x "${GRADLE_CMD}" ]; then
  mkdir -p "${WRAPPER_HOME}" "${DIST_HOME}"
  if [ ! -f "${ZIP_FILE}" ]; then
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL "${DIST_URL}" -o "${ZIP_FILE}"
    elif command -v wget >/dev/null 2>&1; then
      wget -O "${ZIP_FILE}" "${DIST_URL}"
    else
      echo "curl or wget is required to download Gradle." >&2
      exit 1
    fi
  fi
  rm -rf "${GRADLE_HOME}"
  unzip -q -o "${ZIP_FILE}" -d "${DIST_HOME}"
fi

load_env_file() {
  if [ -f "$1" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$1"
    set +a
  fi
}

load_env_file "${APP_HOME}/.env"
load_env_file "${APP_HOME}/.env.local"

if [ "${1-}" = "bootRun" ] && [ -z "${SPRING_PROFILES_ACTIVE-}" ]; then
  export SPRING_PROFILES_ACTIVE=local
fi

export DEFAULT_JVM_OPTS="-Xms128m -Xmx512m"
exec "${GRADLE_CMD}" "$@"
