import logging, sys

logger = logging.getLogger(__name__)

if not logger.handlers:
    stream_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(levelname)s] - %(asctime)s - %(message)s (%(filename)s:%(lineno)d)"
    )
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
    logger.setLevel(logging.INFO)
    
    

    
    