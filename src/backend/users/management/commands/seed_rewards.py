from django.core.management.base import BaseCommand
from users.models import Reward

class Command(BaseCommand):
    help = 'Seed the database with initial rewards data'

    def handle(self, *args, **kwargs):
        rewards_data = [
            {
                "name": "Coffee Voucher",
                "points_cost": 500,
                "icon": "☕",
                "category": "Food",
                "description": "Get a free regular coffee at participating outlets."
            },
            {
                "name": "Plant a Tree",
                "points_cost": 300,
                "icon": "🌱",
                "category": "Eco",
                "description": "We will plant a tree in your name in a reforestation zone."
            },
            {
                "name": "10% Off Eco Store",
                "points_cost": 800,
                "icon": "🛍️",
                "category": "Shopping",
                "description": "Get a 10% discount on any purchase at our partner eco-stores."
            },
            {
                "name": "Eco Warrior Badge",
                "points_cost": 1000,
                "icon": "🏅",
                "category": "Badge",
                "description": "A prestigious digital badge displayed on your profile."
            },
            {
                "name": "Free Pickup",
                "points_cost": 1200,
                "icon": "🚚",
                "category": "Service",
                "description": "Get a priority free pickup for any amount of e-waste."
            },
            {
                "name": "Solar Charger",
                "points_cost": 2500,
                "icon": "☀️",
                "category": "Gift",
                "description": "A portable solar-powered charger for your mobile devices."
            },
        ]

        for data in rewards_data:
            reward, created = Reward.objects.get_or_create(
                name=data["name"],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created reward "{reward.name}"'))
            else:
                self.stdout.write(f'Reward "{reward.name}" already exists')

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
