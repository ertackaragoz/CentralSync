using CentralSync.API.Models.DTO;
using FluentValidation;

namespace CentralSync.API.Validators
{
    public class CreateTaskRequestDtoValidator : AbstractValidator<CreateTaskRequestDto>
    {
        public CreateTaskRequestDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Task title cannot be empty.")
                .MaximumLength(200).WithMessage("Task title can't be longer than 200 characters.");

            RuleFor(x => x.EstimatedHours)
                .GreaterThanOrEqualTo(0).When(x => x.EstimatedHours.HasValue)
                .WithMessage("Estimated hours cannot be negative.");

            RuleFor(x => x.DueDate)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).When(x => x.DueDate.HasValue)
                .WithMessage("Due date cannot be in the past.");
        }
    }
}