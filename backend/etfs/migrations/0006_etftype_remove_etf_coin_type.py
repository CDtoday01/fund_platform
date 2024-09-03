# Generated by Django 4.2 on 2024-09-02 08:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('etfs', '0005_etf_code_etf_coin_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='ETFType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('etf_code', models.CharField(max_length=10, unique=True)),
                ('category_code', models.CharField(max_length=10)),
                ('category', models.CharField(max_length=100)),
                ('subcategory_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.RemoveField(
            model_name='etf',
            name='coin_type',
        ),
    ]
