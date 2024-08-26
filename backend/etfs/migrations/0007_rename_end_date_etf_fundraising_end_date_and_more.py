# Generated by Django 4.2 on 2024-08-23 09:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0006_rename_duration_etf_fundraising_duration_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='etf',
            old_name='end_date',
            new_name='fundraising_end_date',
        ),
        migrations.RenameField(
            model_name='etf',
            old_name='start_date',
            new_name='fundraising_start_date',
        ),
        migrations.RemoveField(
            model_name='etf',
            name='is_active',
        ),
        migrations.AddField(
            model_name='etf',
            name='announcement_duration',
            field=models.IntegerField(default=7),
            preserve_default=False,
        ),
    ]
