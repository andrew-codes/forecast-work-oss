FROM python:3.8

RUN apt-get update --fix-missing
RUN apt-get upgrade -y
RUN apt-get install -y \
    curl

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update --fix-missing

RUN apt-get install -y \
    pandoc \
    yarn

RUN mkdir -p /usr/local/bin
RUN ln -s /usr/bin/gpg /usr/local/bin/gpg

CMD ["bash"]