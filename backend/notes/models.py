from django.db import models
from users.models import User

class Category(models.Model):
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7, default='#FFFFFF')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories", null=True, blank=True)

    def __str__(self):
        return self.name

class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey("Category", on_delete=models.CASCADE)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
