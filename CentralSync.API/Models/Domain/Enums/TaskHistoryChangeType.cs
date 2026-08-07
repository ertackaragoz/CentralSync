namespace CentralSync.API.Models.Domain.Enums
{
    public enum TaskHistoryChangeType
    {
        StatusChanged = 1,
        AssignedUserChanged = 2,
        PriorityChanged = 3,
        TitleChanged = 4,
        DescriptionChanged = 5,
        TaskProjectChanged = 6,
        DueDateChanged = 7,
        EstimatedHoursChanged = 8,
        Updated = 9
    }
}
