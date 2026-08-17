export async function loadProjectRoles(api, projects, currentUserId) {
    if (!currentUserId || !projects.length) return {};

    const entries = await Promise.all(
        projects.map(async project => {
            if (String(project.ownerId) === String(currentUserId)) {
                return [project.id, 'Owner'];
            }

            try {
                const response = await api.get(`/projects/${project.id}/members`);
                const members = response.data.items || response.data || [];
                const member = members.find(
                    item => String(item.userId) === String(currentUserId)
                );

                return [project.id, member?.role || null];
            } catch {
                return [project.id, null];
            }
        })
    );

    return Object.fromEntries(entries);
}
