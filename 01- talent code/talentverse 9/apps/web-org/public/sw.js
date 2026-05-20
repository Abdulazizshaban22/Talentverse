
self.addEventListener('push', function(event) {
  const data = event.data?.json() || { title: 'TalentVerse', body:'إشعار جديد' };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});
