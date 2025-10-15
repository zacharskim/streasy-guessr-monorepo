import asyncio
import aiohttp
import json
from pathlib import Path
import time
from typing import Dict


async def download_image(
    session: aiohttp.ClientSession,
    image_id: str,
    output_dir: Path,
    listing_id: str,
    image_index: int,
) -> bool:
    """
    Download a single image by its ID.

    Args:
        session: aiohttp session for making requests
        image_id: The image hash/ID from scraped data
        output_dir: Directory to save images
        listing_id: Listing ID to associate with image
        image_index: Index of this image for the listing (0-indexed)

    Returns:
        bool: True if download succeeded, False otherwise
    """
    # Zillow/StreetEasy CDN pattern - using extra_large for better quality
    # Options: se_large_800_400, se_extra_large, se_huge_1500_800, cc_ft_1536
    url = f"https://photos.zillowstatic.com/fp/{image_id}-cc_ft_1536.webp"

    try:
        async with session.get(
            url, timeout=aiohttp.ClientTimeout(total=30)
        ) as response:
            if response.status == 200:
                # Save with listing_id prefix and image index for easy association
                # Format: {listing_id}_{index}.webp
                output_path = output_dir / f"{listing_id}_{image_index}.webp"
                with open(output_path, "wb") as f:
                    f.write(await response.read())
                print(f"✓ Downloaded: {listing_id}_{image_index}.webp")
                return True
            else:
                print(f"✗ HTTP {response.status} for {image_id}")
                return False
    except asyncio.TimeoutError:
        print(f"✗ Timeout downloading {image_id}")
        return False
    except Exception as e:
        print(f"✗ Error downloading {image_id}: {e}")
        return False


async def download_listing_images(
    session: aiohttp.ClientSession,
    listing: Dict,
    output_dir: Path,
    semaphore: asyncio.Semaphore,
    max_images: int = 5,
) -> Dict:
    """
    Download images for a single listing (up to max_images).

    Args:
        session: aiohttp session
        listing: Apartment listing dict with image_ids
        output_dir: Directory to save images
        semaphore: Semaphore to limit concurrent downloads
        max_images: Maximum number of images to download per listing (default: 5)

    Returns:
        Dict with download stats
    """
    image_ids = listing.get("image_ids", [])
    listing_id = listing.get("listing_id", "unknown")

    if not image_ids:
        return {
            "listing_id": listing_id,
            "success": 0,
            "failed": 0,
            "downloaded_images": [],
        }

    # Limit to first N images
    image_ids_to_download = image_ids[:max_images]

    print(
        f"\nDownloading {len(image_ids_to_download)} images for listing {listing_id}..."
    )

    results = {
        "listing_id": listing_id,
        "success": 0,
        "failed": 0,
        "downloaded_images": [],
    }

    for idx, image_id in enumerate(image_ids_to_download):
        async with semaphore:  # Limit concurrent downloads
            success = await download_image(
                session, image_id, output_dir, listing_id, idx
            )
            if success:
                results["success"] += 1
                results["downloaded_images"].append(f"{listing_id}_{idx}.webp")
            else:
                results["failed"] += 1

            await asyncio.sleep(0.1)

    return results


async def main():
    """Main function to download all images from scraped apartments."""

    # Configuration
    MAX_IMAGES_PER_LISTING = 5

    # Load scraped data
    data_file = Path("scraped_apartments.json")
    if not data_file.exists():
        print(f"✗ Error: {data_file} not found!")
        print("Run the scraper first to generate apartment data.")
        return

    with open(data_file, "r") as f:
        apartments = json.load(f)

    print(f"Loaded {len(apartments)} apartments from {data_file}")

    # Count total images (limited per listing)
    total_images = sum(
        min(len(apt.get("image_ids", [])), MAX_IMAGES_PER_LISTING) for apt in apartments
    )
    print(
        f"Total images to download: {total_images} ({MAX_IMAGES_PER_LISTING} per listing)"
    )

    output_dir = Path("images")
    output_dir.mkdir(exist_ok=True)
    print(f"Saving images to: {output_dir.absolute()}")

    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector(limit=10)

    semaphore = asyncio.Semaphore(5)

    start_time = time.time()
    all_results = []

    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        tasks = [
            download_listing_images(
                session, listing, output_dir, semaphore, MAX_IMAGES_PER_LISTING
            )
            for listing in apartments
        ]

        all_results = await asyncio.gather(*tasks)

    total_success = sum(r["success"] for r in all_results)
    total_failed = sum(r["failed"] for r in all_results)
    elapsed = time.time() - start_time

    print(f"\n{'='*60}")
    print("DOWNLOAD COMPLETE")
    print(f"{'='*60}")
    print(f"Total images downloaded: {total_success}/{total_images}")
    print(f"Failed: {total_failed}")
    print(f"Time elapsed: {elapsed:.1f}s")
    print(f"Average: {elapsed/len(apartments):.2f}s per listing")
    print(f"Images saved to: {output_dir.absolute()}")

    results_file = Path("download_results.json")
    with open(results_file, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\nDownload results saved to: {results_file}")
    print(f"\nImage naming format: {{listing_id}}_{{index}}.webp")
    print(
        f"Example: For listing 12345, images are: 12345_0.webp, 12345_1.webp, ..., 12345_4.webp"
    )


if __name__ == "__main__":
    asyncio.run(main())
