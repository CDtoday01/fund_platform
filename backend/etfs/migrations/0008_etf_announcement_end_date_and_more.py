# Generated by Django 4.2 on 2024-08-23 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0007_rename_end_date_etf_fundraising_end_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='etf',
            name='announcement_end_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='etf',
            name='announcement_start_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
