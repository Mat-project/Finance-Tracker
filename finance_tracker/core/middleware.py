import logging
import time
from django.conf import settings

logger = logging.getLogger('django')

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Log request
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')}")

        response = self.get_response(request)

        # Log response
        duration = time.time() - start_time
        logger.info(
            f"Response: {request.method} {request.path} completed in {duration:.2f}s "
            f"with status {response.status_code}"
        )

        return response

    def process_exception(self, request, exception):
        logger.error(f"Exception in {request.method} {request.path}: {str(exception)}")
        return None 