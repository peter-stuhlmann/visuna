const handleFormPublishingStatus = async (slug: string, newStatus: boolean) => {
  try {
    const response = await fetch('/api/update-form-publish-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: slug,
        published: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error('Fehler beim Ändern des Veröffentlichungsstatus.');
    }

    // const result = await response.json();
  } catch (err) {
    console.error('Fehler beim Ändern des Veröffentlichungsstatus.:', err);
  }
};

export default handleFormPublishingStatus;
