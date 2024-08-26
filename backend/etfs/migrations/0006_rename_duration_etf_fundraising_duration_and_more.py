# Generated by Django 4.2 on 2024-08-23 08:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0005_remove_etf_state'),
    ]

    operations = [
        migrations.RenameField(
            model_name='etf',
            old_name='duration',
            new_name='fundraising_duration',
        ),
        migrations.AddField(
            model_name='etf',
            name='ETF_duration',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
