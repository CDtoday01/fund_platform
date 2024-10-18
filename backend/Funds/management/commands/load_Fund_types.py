import json
from django.core.management.base import BaseCommand
from Funds.models import FundCategoryType

class Command(BaseCommand):
    help = "Load Fund types from a JSON file into the database"

    def add_arguments(self, parser):
        parser.add_argument("json_file", type=str, help="The path to the JSON file containing Fund types")

    def handle(self, *args, **kwargs):
        json_file = kwargs["json_file"]

        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            for item in data:
                subcategory_code = item.get("代碼")
                category_code = item.get("種類代碼")
                category = item.get("種類")
                subcategory_name = item.get("中類名稱")

                # Create or update the FundType entry
                FundCategoryType.objects.update_or_create(
                    subcategory_code=subcategory_code,
                    defaults={
                        "category_code": category_code,
                        "category": category,
                        "subcategory_name": subcategory_name,
                    }
                )
            
            self.stdout.write(self.style.SUCCESS("Successfully loaded Fund types from JSON file"))
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {json_file}"))
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR(f"Error decoding JSON file: {json_file}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
