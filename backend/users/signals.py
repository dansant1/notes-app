from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from notes.models import Category

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        Category.objects.bulk_create([
            Category(name="Random Thoughts", user=instance),
            Category(name="Personal", user=instance),
            Category(name="School", user=instance),
        ])

