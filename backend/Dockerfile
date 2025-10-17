# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container at /code
COPY ./requirements.txt /code/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the application's code into the container
COPY . /code/

# Tell Docker that the container will listen on this port
# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860

# Command to run the application using uvicorn
# We use --host 0.0.0.0 to make it accessible and --port 7860 to match the EXPOSE command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]