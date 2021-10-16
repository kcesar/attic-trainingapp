using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Kcesar.TrainingSite
{
  public class HttpResponseException : Exception
  {
    public HttpResponseException(int status, object value)
    {
      Status = status;
      Value = value;
    }

    public int Status { get; set; } = 500;

    public object Value { get; set; }
  }

  public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
  {
    public int Order { get; } = int.MaxValue - 10;

    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context)
    {
      if (context.Exception is HttpResponseException exception)
      {
        context.Result = new ObjectResult(exception.Value)
        {
          StatusCode = exception.Status,
        };
        context.ExceptionHandled = true;
      }
    }
  }
}
