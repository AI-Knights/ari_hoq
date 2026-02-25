#!/usr/bin/env python
"""
Quick test to verify streak system works
"""
import os
import sys
import django
from datetime import timedelta

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def test_streak_system():
    print("Testing Streak System...")
    print("=" * 50)
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        email='test_streak@example.com',
        defaults={
            'full_name': 'Test User',
            'is_active': True
        }
    )
    
    if created:
        print(f"✓ Created test user: {user.email}")
    else:
        print(f"✓ Using existing test user: {user.email}")
    
    # Reset streak for testing
    user.current_streak = 0
    user.last_streak_update = None
    user.save()
    print(f"  Initial streak: {user.current_streak}")
    
    # Test 1: First activity
    print("\n1. First activity (should set streak to 1):")
    user.update_streak()
    print(f"   Streak: {user.current_streak} | Last update: {user.last_streak_update}")
    assert user.current_streak == 1, "First activity should set streak to 1"
    assert user.last_streak_update == timezone.now().date(), "Should update to today"
    print("   ✓ PASS")
    
    # Test 2: Same day activity
    print("\n2. Second activity same day (should stay at 1):")
    user.update_streak()
    print(f"   Streak: {user.current_streak} | Last update: {user.last_streak_update}")
    assert user.current_streak == 1, "Same day should not increment"
    print("   ✓ PASS")
    
    # Test 3: Consecutive day activity
    print("\n3. Simulating next day activity (should increment to 2):")
    user.last_streak_update = timezone.now().date() - timedelta(days=1)
    user.save()
    user.update_streak()
    print(f"   Streak: {user.current_streak} | Last update: {user.last_streak_update}")
    assert user.current_streak == 2, "Consecutive day should increment to 2"
    print("   ✓ PASS")
    
    # Test 4: Broken streak
    print("\n4. Simulating 3 days gap (should reset to 1):")
    user.last_streak_update = timezone.now().date() - timedelta(days=3)
    user.save()
    user.update_streak()
    print(f"   Streak: {user.current_streak} | Last update: {user.last_streak_update}")
    assert user.current_streak == 1, "Broken streak should reset to 1"
    print("   ✓ PASS")
    
    # Cleanup
    if created:
        user.delete()
        print(f"\n✓ Cleaned up test user")
    
    print("\n" + "=" * 50)
    print("✅ ALL TESTS PASSED!")
    print("\nStreak System Summary:")
    print("- Daily login/activity updates streak")
    print("- Consecutive days increment streak")
    print("- Missing days reset streak to 1")
    print("- Multiple activities same day don't affect streak")

if __name__ == '__main__':
    try:
        test_streak_system()
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
