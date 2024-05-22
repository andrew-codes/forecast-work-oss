FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive
RUN apt-get -y install --no-install-recommends \
    libxshmfence1 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2
RUN corepack enable
RUN corepack prepare --activate 4.2.2