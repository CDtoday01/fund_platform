# Generated by Django 4.2 on 2024-09-09 05:47

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useretf',
            name='joined_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
