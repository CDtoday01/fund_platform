# Generated by Django 4.2 on 2024-09-24 02:47

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ETF',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('etf_type', models.CharField(default='全球共享經濟ETF', max_length=50)),
                ('code', models.CharField(blank=True, max_length=50, null=True, unique=True)),
                ('total_amount', models.IntegerField()),
                ('lowest_amount', models.IntegerField()),
                ('announcement_start_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('announcement_end_date', models.DateTimeField(blank=True, null=True)),
                ('announcement_duration', models.IntegerField()),
                ('fundraising_start_date', models.DateTimeField()),
                ('fundraising_end_date', models.DateTimeField(blank=True, null=True)),
                ('fundraising_duration', models.IntegerField()),
                ('ETF_duration', models.IntegerField()),
                ('description', models.TextField(blank=True, max_length=500, null=True)),
                ('current_investment', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='ETFCategoryType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category_code', models.CharField(max_length=10)),
                ('category', models.CharField(max_length=100)),
                ('subcategory_code', models.CharField(max_length=10, unique=True)),
                ('subcategory_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='UserETF',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_number', models.IntegerField(blank=True, null=True, unique=True)),
                ('joined_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('leave_date', models.DateTimeField(blank=True, null=True)),
                ('investment_amount', models.IntegerField(default=0)),
                ('etf', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='etfs.etf')),
            ],
        ),
    ]
