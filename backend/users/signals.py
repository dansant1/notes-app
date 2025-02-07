from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from notes.models import Category

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        Category.objects.bulk_create([
            Category(name="Random Thoughts", user=instance, color="#EF9C66"),
            Category(name="Personal", user=instance, color="#78ABA8"),
            Category(name="School", user=instance, color="#FCDC94"),
        ])

