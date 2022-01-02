FROM python:3.8

RUN apt-get update --fix-missing
RUN apt-get upgrade -y
RUN apt-get install -y \
    pandoc

RUN mkdir -p /usr/local/bin
RUN ln -s /usr/bin/gpg /usr/local/bin/gpg

CMD ["bash"]