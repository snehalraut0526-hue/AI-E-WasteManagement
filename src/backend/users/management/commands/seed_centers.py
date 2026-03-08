from django.core.management.base import BaseCommand
from users.models import RecyclingCenter


class Command(BaseCommand):
    help = 'Seed the database with sample recycling centers'

    def handle(self, *args, **kwargs):
        RecyclingCenter.objects.all().delete()

        centers = [
            {
                'name': 'GreenTech E-Waste Hub',
                'address': '12 Baner Road, Baner, Pune - 411045',
                'phone': '+91 20 2560 1234',
                'lat': 18.5590,
                'lng': 73.7868,
                'rating': 4.8,
                'open_now': True,
                'types': 'Phones,Laptops,Batteries',
            },
            {
                'name': 'PuneReclaim Center',
                'address': '45 Koregaon Park, Pune - 411001',
                'phone': '+91 20 2612 5678',
                'lat': 18.5362,
                'lng': 73.8939,
                'rating': 4.5,
                'open_now': True,
                'types': 'TVs,Appliances,Cables',
            },
            {
                'name': 'EcoDispose Pro',
                'address': '88 Hinjewadi Phase 2, Pune - 411057',
                'phone': '+91 20 6699 3456',
                'lat': 18.5912,
                'lng': 73.7389,
                'rating': 4.2,
                'open_now': False,
                'types': 'All Electronics',
            },
            {
                'name': 'CircularTech Warje',
                'address': '200 Warje Malwadi Road, Warje, Pune - 411058',
                'phone': '+91 20 2421 7890',
                'lat': 18.4857,
                'lng': 73.8016,
                'rating': 4.7,
                'open_now': True,
                'types': 'Phones,Tablets,Printers',
            },
            {
                'name': 'GreenCycle Hadapsar',
                'address': '55 Magarpatta City Road, Hadapsar, Pune - 411028',
                'phone': '+91 20 2682 2345',
                'lat': 18.5089,
                'lng': 73.9259,
                'rating': 4.6,
                'open_now': True,
                'types': 'Batteries,Cables,Appliances',
            },
            {
                'name': 'ReNew Kothrud Depot',
                'address': '10 Karve Road, Kothrud, Pune - 411038',
                'phone': '+91 20 2543 6789',
                'lat': 18.5074,
                'lng': 73.8077,
                'rating': 4.3,
                'open_now': True,
                'types': 'Laptops,Monitors,Printers',
            },
        ]

        for data in centers:
            RecyclingCenter.objects.create(**data)
            self.stdout.write(self.style.SUCCESS(f"  Created: {data['name']}"))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded {len(centers)} recycling centers!'))
