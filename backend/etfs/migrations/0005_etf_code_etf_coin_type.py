# Generated by Django 4.2 on 2024-09-02 05:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0004_alter_etf_lowest_amount_alter_etf_total_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='etf',
            name='code',
            field=models.CharField(default=0, max_length=50, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='etf',
            name='coin_type',
            field=models.CharField(default='AA', max_length=2),
            preserve_default=False,
        ),
    ]
