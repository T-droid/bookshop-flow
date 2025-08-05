from typing import Generic, TypeVar, Optional


T = TypeVar('T')


class ServiceResult(Generic[T]):
    """
    A generic class to represent the result of a service operation.
    It can hold either a successful result or an error message.
    """
    def __init__(self, data: Optional[T] = None, error: Optional[str] = None, success: bool = True, message: Optional[str] = None):
        self.data = data
        self.error = error
        self.success = success
        self.message = message

    def is_success(self) -> bool:
        return self.error is None

    def __repr__(self):
        return f"ServiceResult(data={self.data}, error={self.error}, success={self.success}, message={self.message})"