using System.Collections.Concurrent;
using backend.Dtos;

namespace backend.Services;

public class AdminLogStore
{
    private const int MaxEntries = 200;
    private readonly ConcurrentQueue<AdminLogEntry> _entries = new();

    public void Add(string level, string category, string message, string? actor = null)
    {
        var entry = new AdminLogEntry(
            Guid.NewGuid().ToString("N")[..12],
            DateTimeOffset.UtcNow,
            level,
            category,
            message,
            actor
        );

        _entries.Enqueue(entry);

        while (_entries.Count > MaxEntries && _entries.TryDequeue(out _))
        {
        }
    }

    public IReadOnlyList<AdminLogEntry> GetRecent(int limit = 100)
    {
        return _entries.Reverse().Take(Math.Clamp(limit, 1, MaxEntries)).ToList();
    }
}
