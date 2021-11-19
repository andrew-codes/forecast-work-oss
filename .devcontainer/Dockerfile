FROM python:3.8
RUN apt-get update --fix-missing
RUN apt-get upgrade -y
RUN apt-get install -y \
    pandoc

RUN pip install jupyterlab \
    ipykernel \
    matplotlib \
    seaborn \
    nbconvert
RUN jupyter serverextension enable --py jupyterlab

WORKDIR /app

CMD ["bash"]