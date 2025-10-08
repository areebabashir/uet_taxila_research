import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import uetLogo from '@/assets/download-removebg-preview.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Research', href: '/research', isDropdown: true },
    { name: 'Faculty', href: '/faculty' },
    { name: 'Funding', href: '/funding' },
    { name: 'Contact', href: '/contact' },
  ];

  const researchItems = [
    { name: 'Publications', href: '/publications' },
    { name: 'Theses', href: '/theses' },
    { name: 'Travel Grants', href: '/travel-grants' },
    { name: 'FYP Projects', href: '/fyp-projects' },
    { name: 'Events', href: '/events' },
    { name: 'Research Projects', href: '/research-projects' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="bg-card shadow-card sticky top-0 z-50 border-b border-border/50">
      <div className="container-max">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={uetLogo} alt="UET Taxila Logo" className="h-10 w-auto" />
            <span className="font-poppins font-bold text-xl text-primary hidden sm:block">
              UET Taxila
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`font-medium transition-colors duration-200 ${
                        researchItems.some(ri => isActive(ri.href))
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {researchItems.map((researchItem) => (
                      <DropdownMenuItem key={researchItem.name} asChild>
                        <Link
                          to={researchItem.href}
                          className={`w-full ${
                            isActive(researchItem.href)
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {researchItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Right side items */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search research..."
                className="pl-10 w-64 bg-muted/50 border-border/50 focus:bg-card"
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-t border-border/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                item.isDropdown ? (
                  <div key={item.name} className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-muted-foreground">
                      {item.name}
                    </div>
                    {researchItems.map((researchItem) => (
                      <Link
                        key={researchItem.name}
                        to={researchItem.href}
                        className={`block px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive(researchItem.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {researchItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search research..."
                    className="pl-10 w-full bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;